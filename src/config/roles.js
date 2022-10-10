const allRoles = {
    freelancer: [],
    employer: [],
    admin: ['getUsers', 'manageUsers']
};

const roleValues = {
    ADMIN: 'admin',
    FREELANCER: 'freelancer',
    EMPLOYER: 'employer'
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleValues,
    roleRights
};