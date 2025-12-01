
// Service to fetch YouTube transcripts via robust proxy scraping
// We rotate proxies to avoid rate limits and improve reliability.

const PROXY_ROTATION = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

export const getYoutubeTranscript = async (videoId: string): Promise<string> => {
  let lastError: any = null;

  // Try scraping via proxies
  for (const proxyFn of PROXY_ROTATION) {
    try {
      console.log("Attempting to fetch via proxy...");
      const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const proxyUrl = proxyFn(videoPageUrl);
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Proxy status: ${response.status}`);
      const html = await response.text();

      // Extract Captions
      const captionTracks = extractCaptionTracks(html);
      if (!captionTracks || captionTracks.length === 0) {
        // If no captions in the HTML, it might be a "consent" page or age-gated, 
        // which proxies often hit. Move to next proxy.
        throw new Error("No caption tracks found in HTML.");
      }

      // Prioritize manually created English subtitles, then auto-generated English
      const track = captionTracks.find((t: any) => t.languageCode === 'en' && t.kind !== 'asr') ||
                    captionTracks.find((t: any) => t.languageCode === 'en') ||
                    captionTracks.find((t: any) => t.languageCode.startsWith('en')) ||
                    captionTracks[0];

      if (!track) {
        throw new Error("No suitable English caption track found.");
      }

      // Fetch the actual XML transcript
      // We also need to proxy this request
      const trackUrl = track.baseUrl;
      const proxyTrackUrl = proxyFn(trackUrl);
      
      const xmlResponse = await fetch(proxyTrackUrl);
      if (!xmlResponse.ok) throw new Error("Failed to fetch caption XML");
      const xml = await xmlResponse.text();

      return parseTranscriptXml(xml);

    } catch (e: any) {
      console.warn("Proxy attempt failed:", e.message);
      lastError = e;
      // Continue to next proxy in rotation
    }
  }

  throw new Error(lastError?.message || "Could not retrieve captions. The video might be private, have no captions, or the connection was blocked. Please try the 'Demo' button.");
};

// --- Helpers ---

function extractCaptionTracks(html: string): any[] {
  // Look for the "captionTracks" JSON inside the player response
  // Pattern 1: Inside ytInitialPlayerResponse
  const match1 = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (match1) {
    try {
      return JSON.parse(match1[1]);
    } catch (e) { console.error("Error parsing caption JSON match 1", e); }
  }

  // Pattern 2: More generic search for the array structure
  // This is a bit looser but can catch it if formatting differs
  const match2 = html.match(/{"baseUrl":".*?","name":{.*?}/g);
  if (match2) {
     // Reconstruct array
     const constructedJson = `[${match2.join(',')}]`;
     try {
       return JSON.parse(constructedJson);
     } catch (e) { console.error("Error parsing caption JSON match 2", e); }
  }

  return [];
}

function parseTranscriptXml(xml: string): string {
  // Remove XML headers if present
  const textSegments: string[] = [];
  
  // Regex to match <text start="123" dur="5">Content</text>
  // Handling attributes in any order
  const regex = /<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1]);
    let text = match[2]
      .replace(/<[^>]+>/g, '') // strip nested tags
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    // Decode HTML entities roughly
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    if (!text) continue;

    const minutes = Math.floor(start / 60);
    const seconds = Math.floor(start % 60);
    const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
    
    textSegments.push(`${timestamp} ${text}`);
  }

  // Fallback if regex failed (maybe simple formatting)
  if (textSegments.length === 0) {
     return xml.replace(/<[^>]*>/g, ' ').slice(0, 1000); // Rough fallback
  }

  return textSegments.join('\n');
}
