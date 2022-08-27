import prisma from "../../prisma.js";

const createByCompanyID = async (companyID, data) =>
  await prisma.offer.create({
    data: {
      ...data,
      company: {
        connect: { ID: companyID },
      },
    },
  });

const getByID = async (offerID) =>
  await prisma.offer.findFirst({
    where: {
      ID: offerID,
    },
    include: {
      company: {
        select: {
          name: true,
          logo: true,
          administrators: {
            select: {
              ID: true,
            },
          },
        },
      },
    },
  });

const removeByID = async (offerID) =>
  await prisma.offer.delete({
    where: {
      ID: offerID,
    },
  });

const updateByID = async (offerID, data) =>
  await prisma.offer.update({
    where: {
      ID: offerID,
    },
    data,
  });

const getAdministratorsByID = async (offerID) =>
  await prisma.offer.findFirst({
    where: {
      ID: offerID,
    },
    select: {
      company: {
        select: {
          administrators: {
            select: {
              ID: true,
            },
          },
        },
      },
    },
  });

const getPageByOffset = async (skip, take, where) =>
  await prisma.offer.findMany({
    skip,
    take,
    where,
    select: {
      ID: true,
      title: true,
      place: true,
      country: true,
      created_at: true,
      close_at: true,
      employment: true,
      arrangement: true,
      reward: true,
      closed: true,
      salary: true,
      company: {
        select: {
          ID: true,
          logo: true,
          name: true,
        },
      },
    },
  });

const getCount = async (where) => await prisma.offer.count({ where });

const addFollowerByID = async (offerID, userID) =>
  await prisma.offer.update({
    where: {
      ID: offerID,
    },
    data: {
      followers: {
        connect: { ID: userID },
      },
    },
  });

const removeFollowerByID = async (offerID, userID) =>
  await prisma.offer.update({
    where: {
      ID: offerID,
    },
    data: {
      followers: {
        disconnect: { ID: userID },
      },
    },
  });

export {
  getPageByOffset,
  createByCompanyID,
  removeByID,
  updateByID,
  getByID,
  getAdministratorsByID,
  getCount,
  addFollowerByID,
  removeFollowerByID,
};
