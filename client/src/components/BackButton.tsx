import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/**
 * Reusable back button component
 * Shows on iOS/Desktop, hides on Android (which has native back button)
 * Automatically handles navigation history
 */
export default function BackButton() {
  const [, navigate] = useLocation();
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    // Detect if running on Android
    const isAndroid = /Android/.test(navigator.userAgent);
    setShowButton(!isAndroid);
  }, []);

  const handleBack = () => {
    // Try to go back in browser history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home if no history
      navigate("/");
    }
  };

  // Don't render on Android (has native back button)
  if (!showButton) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="rounded-full hover:bg-accent"
      title="뒤로 가기 (Go back)"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
