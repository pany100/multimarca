import { PUT } from "@/app/api/autos/[id]/cedula/route";
import { PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

jest.mock("@prisma/client");
jest.mock("@aws-sdk/client-s3");

describe("PUT /api/autos/[id]/cedula", () => {
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockS3Client: jest.Mocked<S3Client>;

  beforeEach(() => {
    mockPrisma = {
      auto: {
        update: jest.fn(),
      },
    } as any;
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

    mockS3Client = {
      send: jest.fn(),
    } as any;
    (S3Client as jest.Mock).mockImplementation(() => mockS3Client);
  });

  test("Debería devolver un error si no se proporciona un archivo", async () => {
    const mockFormData = {
      get: jest.fn().mockReturnValue(null),
    };
    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, { params: { id: "1" } });
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({
      mensaje: "No se proporcionó ningún archivo",
    });
  });

  test("Debería devolver un error si la extensión del archivo no está permitida", async () => {
    const mockFile = {
      name: "archivo.txt",
      type: "text/plain",
    };
    const mockFormData = {
      get: jest.fn().mockReturnValue(mockFile),
    };
    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest;

    const response = await PUT(mockRequest, { params: { id: "1" } });
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({ mensaje: "Tipo de archivo no permitido" });
  });

  test("Debería actualizar correctamente la cédula verde del auto", async () => {
    const mockFile = {
      name: "cedula.jpg",
      type: "image/jpeg",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    };
    const mockFormData = {
      get: jest.fn().mockReturnValue(mockFile),
    };
    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest;

    const mockUpdatedCar = {
      id: 1,
      cedulaVerdePath: "https://ejemplo.com/cedula.jpg",
    };
    mockPrisma = {
      auto: {
        update: jest.fn().mockResolvedValue(mockUpdatedCar),
        findUnique: jest.fn().mockResolvedValue(mockUpdatedCar),
      },
    } as unknown as jest.Mocked<PrismaClient>;
    mockS3Client = {
      send: jest.fn().mockResolvedValue({} as PutObjectCommandOutput),
      destroy: jest.fn(),
    } as unknown as jest.Mocked<S3Client>;
    const response = await PUT(mockRequest, { params: { id: "1" } });
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockUpdatedCar);
    expect(mockS3Client.send).toHaveBeenCalledTimes(2);
    expect(mockPrisma.auto.update).toHaveBeenCalledTimes(1);
  });
});
