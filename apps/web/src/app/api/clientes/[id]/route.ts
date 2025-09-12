import { ClienteService } from "@/core/application/services/cliente.service";
import { GetClienteUseCase } from "@/core/application/use-cases/cliente/get-cliente.use-case";
import { PrismaClienteRepository } from "@/core/infrastructure/database/repositories/prisma-cliente.repository";
import { getClienteQuerySchema } from "@/core/infrastructure/validation/schemas/cliente.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      phone,
      fullName,
      email,
      birthday,
      address,
      city,
      state,
      postal_code,
      tax_status,
      dni,
      can_receive_notifications,
    } = body;

    const updateData: any = {};

    if (phone !== undefined) {
      updateData.phone = phone;
    }
    if (fullName !== undefined) {
      updateData.fullName = fullName.toUpperCase();
    }
    if (email !== undefined) {
      updateData.email = email;
    }
    if (birthday !== undefined) {
      updateData.birthday = birthday ? new Date(birthday) : null;
    }
    if (address !== undefined) {
      updateData.address = address;
    }
    if (city !== undefined) {
      updateData.city = city;
    }
    if (state !== undefined) {
      updateData.state = state;
    }
    if (postal_code !== undefined) {
      updateData.postal_code = postal_code;
    }
    if (tax_status !== undefined) {
      updateData.tax_status = tax_status;
    }
    if (dni !== undefined) {
      updateData.dni = dni;
    }
    if (can_receive_notifications !== undefined) {
      updateData.can_receive_notifications = can_receive_notifications;
    }

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: updateData,
      include: {
        cars: true,
      },
    });

    return NextResponse.json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return NextResponse.json(
      { error: "Error al actualizar el cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const clienteEliminado = await prisma.cliente.delete({
      where: { id },
    });

    if (!clienteEliminado) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Cliente eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return NextResponse.json(
      { error: "Error al eliminar el cliente" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const dto = await validateRequest(
      {
        id,
      },
      getClienteQuerySchema
    );
    const cliente = await new GetClienteUseCase(
      new ClienteService(new PrismaClienteRepository())
    ).execute(dto);

    return NextResponse.json(cliente);
  } catch (error) {
    return handleApiError(error);
  }
}
