import { FastifyInstance } from "fastify";
import { contractService } from "../services/contract.service.js";
import { contractSchemas } from "../schemas/contract.schema.js";

export default async function contractRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const auth = {
    preHandler: fastify.authenticate,
  };

  const contractManagerAuth = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(["ADMIN", "MANAGER", "PROPERTY_OWNER"]),
    ],
  };

  const paymentManagerAuth = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRoles(["ADMIN", "MANAGER", "ACCOUNTANT"]),
    ],
  };

  fastify.post(
    "/",
    {
      schema: contractSchemas.createContractSchema,
      ...contractManagerAuth,
    },
    contractService.createContract
  );

  fastify.get(
    "/",
    {
      schema: contractSchemas.listContractsSchema,
      ...auth,
    },
    contractService.listContracts as any
  );

  fastify.get(
    "/:id",
    {
      schema: contractSchemas.getContractSchema,
      ...auth,
    },
    contractService.getContractById as any
  );

  fastify.put(
    "/:id",
    {
      schema: contractSchemas.updateContractSchema,
      ...contractManagerAuth,
    },
    contractService.updateContract
  );

  fastify.delete(
    "/:id",
    {
      schema: contractSchemas.deleteContractSchema,
      ...contractManagerAuth,
    },
    contractService.deleteContract
  );

  fastify.post(
    "/:id/terminate",
    {
      schema: contractSchemas.terminateContractSchema,
      ...contractManagerAuth,
    },
    contractService.terminateContract
  );

  fastify.post(
    "/:contractId/payments",
    {
      schema: contractSchemas.addRentPaymentSchema,
      ...paymentManagerAuth,
    },
    contractService.addRentPayment
  );

  fastify.put(
    "/:contractId/payments/:paymentId",
    {
      schema: contractSchemas.updateRentPaymentSchema,
      ...paymentManagerAuth,
    },
    contractService.updateRentPayment
  );

  fastify.delete(
    "/:contractId/payments/:paymentId",
    {
      ...paymentManagerAuth,
    },
    contractService.deleteRentPayment
  );
}
