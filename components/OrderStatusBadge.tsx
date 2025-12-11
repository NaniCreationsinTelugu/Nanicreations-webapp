import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
    status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-500 hover:bg-yellow-600";
            case "paid":
                return "bg-blue-500 hover:bg-blue-600";
            case "shipped":
                return "bg-purple-500 hover:bg-purple-600";
            case "delivered":
                return "bg-green-500 hover:bg-green-600";
            case "cancelled":
                return "bg-red-500 hover:bg-red-600";
            case "failed":
                return "bg-gray-500 hover:bg-gray-600";
            default:
                return "bg-gray-500 hover:bg-gray-600";
        }
    };

    return (
        <Badge className={`${getStatusColor(status)} text-white`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
