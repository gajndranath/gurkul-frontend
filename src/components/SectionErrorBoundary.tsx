import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  title?: string;
}
interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 border-2 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/50">
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-2">
            Module Sync Failed
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            Connectivity issue or node failure in{" "}
            {this.props.title || "this section"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl text-[10px] font-black uppercase"
          >
            <RefreshCw size={14} className="mr-2" /> Re-initialize Node
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
