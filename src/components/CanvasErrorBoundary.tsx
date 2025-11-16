import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error in Canvas:", error, errorInfo);
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallbackText = "Loading error" } = this.props;

    if (hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-black text-white p-4">
          {fallbackText}
        </div>
      );
    }

    return children;
  }
}
