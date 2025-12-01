interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (src = "https://checkout.razorpay.com/v1/checkout.js") => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true);
        return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const handlePayment = async (
  amount: number, 
  planName: string, 
  userEmail: string,
  onSuccess: () => void
) => {
  const res = await loadRazorpay();

  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  // In a real app, you would hit your backend here to create an Order ID
  // const data = await fetch('/api/payment/order', { ... }).then((t) => t.json());

  const options: RazorpayOptions = {
    key: "rzp_test_SimulatedKey", // Replace with real Razorpay Key ID
    amount: amount * 100, // Amount is in currency subunits. Default currency is INR.
    currency: "USD",
    name: "TranscriptPRO",
    description: `Upgrade to ${planName}`,
    image: "https://picsum.photos/200",
    handler: function (response: any) {
      console.log("Payment Successful", response);
      // alert(response.razorpay_payment_id);
      // Verify payment on backend here
      onSuccess();
    },
    prefill: {
      name: "User Name",
      email: userEmail,
    },
    theme: {
      color: "#6366f1",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};