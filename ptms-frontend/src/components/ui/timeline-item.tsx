import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineItemProps {
  status: "completed" | "current" | "upcoming";
  title: string;
  desc: string;
}

export function TimelineItem({ status, title, desc }: TimelineItemProps) {
  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "current":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "upcoming":
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getItemStyle = () => {
    switch (status) {
      case "completed":
        return "text-green-900";
      case "current":
        return "text-blue-900";
      case "upcoming":
        return "text-gray-500";
    }
  };

  return (
    <div className="relative flex items-start space-x-4 pb-8">
      <div className="flex-shrink-0 relative">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          status === "completed" ? "bg-green-100 border-green-600" :
          status === "current" ? "bg-blue-100 border-blue-600" :
          "bg-gray-100 border-gray-300"
        }`}>
          {getIcon()}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={`text-sm font-medium ${getItemStyle()}`}>{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}
