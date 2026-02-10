import React from "react";
import { AlertCircle, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardStatusProps {
    type: "empty" | "error";
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

const DashboardStatus = ({
    type,
    title,
    message,
    onRetry,
    className,
}: DashboardStatusProps) => {
    const isError = type === "error";

    return (
        <Card
            className={cn(
                "border-dashed border-2 flex items-center justify-center p-8 bg-muted/5",
                className
            )}
        >
            <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
                <div
                    className={cn(
                        "p-4 rounded-full",
                        isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}
                >
                    {isError ? <AlertCircle size={32} /> : <Database size={32} />}
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">
                        {title || (isError ? "Something went wrong" : "No data available")}
                    </h3>
                    <p className="text-muted-foreground max-w-[250px] mx-auto text-sm font-medium">
                        {message ||
                            (isError
                                ? "We encountered an error while fetching your data. Please try again."
                                : "There is no information to display for the selected filters.")}
                    </p>
                </div>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="rounded-xl font-bold gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default DashboardStatus;
