import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import StatusDropdown from "./StatusDropdown";

const Page = async () => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      console.error("No user found in session");
      redirect("/api/auth/login");
    }

    const orders = await db.order.findMany({
      where: {
        isPaid: true,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        shippingAddress: true,
      },
    });

    const lastWeekSum = await db.order.aggregate({
      where: {
        isPaid: true,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const lastMonthSum = await db.order.aggregate({
      where: {
        isPaid: true,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const WEEKLY_GOAL = 500;
    const MONTHLY_GOAL = 2500;

    return (
      <div className="flex min-h-screen w-full bg-muted/40">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
          <div className="flex flex-col gap-16">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Last Week</CardDescription>
                  <CardTitle className="text-4xl">
                    {formatPrice(lastWeekSum._sum.amount ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={((lastWeekSum._sum.amount ?? 0) / WEEKLY_GOAL) * 100}
                  />
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    of {formatPrice(WEEKLY_GOAL)} goal
                  </p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Last Month</CardDescription>
                  <CardTitle className="text-4xl">
                    {formatPrice(lastMonthSum._sum.amount ?? 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={
                      ((lastMonthSum._sum.amount ?? 0) / MONTHLY_GOAL) * 100
                    }
                  />
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    of {formatPrice(MONTHLY_GOAL)} goal
                  </p>
                </CardFooter>
              </Card>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {order.shippingAddress?.name ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        <StatusDropdown
                          id={order.id}
                          orderStatus={order.status}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatPrice(order.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in dashboard page:", error);
    redirect("/");
  }
};

export default Page;
