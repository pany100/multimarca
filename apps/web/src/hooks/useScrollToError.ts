import { useEffect, useRef } from "react";

type Props = {
  errors: Record<string, any>;
  isSubmitted: boolean;
};

function useScrollToError({ errors, isSubmitted }: Props) {
  const errorFieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToFirstError = () => {
    if (Object.keys(errors).length === 0) return;

    // Get the first error field name
    const firstErrorField = Object.keys(errors)[0];

    // Get the element reference
    const errorElement = errorFieldRefs.current[firstErrorField];

    if (errorElement) {
      // Scroll to the element with smooth behavior
      errorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Try to focus the element if it's an input
      const inputElement = errorElement.querySelector(
        "input, textarea, select"
      ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (inputElement) {
        setTimeout(() => {
          inputElement.focus();
        }, 500); // Small delay to ensure scroll completes first
      }
    }
  };

  // Register a field reference
  const registerFieldRef = (name: string, element: HTMLDivElement | null) => {
    if (element) {
      errorFieldRefs.current[name] = element;
    }
  };

  useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      scrollToFirstError();
    }
  }, [errors, isSubmitted]);

  return { registerFieldRef };
}

export default useScrollToError;
