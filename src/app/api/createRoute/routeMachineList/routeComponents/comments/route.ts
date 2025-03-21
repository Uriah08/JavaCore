import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { routeComponentCommentSchema } from "@/schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.id !== process.env.ADMIN) {
      throw new Error("Not Authenticated");
    }

    const body = await req.json();
    console.log("Received body:", body);

    const validationResult = routeComponentCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: validationResult.error.errors,
          success: false,
        },
        { status: 400 }
      );
    }

    const { routeComponentId, severity, comment } = validationResult.data;

    const newComment = await prisma.routeComponentComment.create({
      data: {
        routeComponentId,
        severity,
        comment,
      },
    });

    return NextResponse.json(
      {
        message: "Comment added successfully",
        data: newComment,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.id !== process.env.ADMIN) {
      throw new Error("Not Authenticated");
    }

    const { searchParams } = new URL(req.url);
    const routeComponentId = searchParams.get("routeComponentId");

    if (!routeComponentId) {
      return NextResponse.json(
        { message: "Missing routeComponentId", success: false },
        { status: 400 }
      );
    }

    const getComment = await prisma.routeComponentComment.findMany({
      where: {
        routeComponentId: routeComponentId,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        severity: true,
        comment: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Comments successfully fetched",
        data: getComment,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
