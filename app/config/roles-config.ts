import { Role } from 'frontend-data-monitoring/constants/roles';

export interface RoleDetails {
  description: string;
  enum: keyof typeof Role;
}

const roleConfig: Record<string, RoleDetails> = {
  'DM-AdminUnitAdministratorRole': {
    description: 'Can only view its own data.',
    enum: 'OrgUser',
  },
  'DM-LeveranciersGebruiker': {
    description: 'Can view municipalities they are responsible for.',
    enum: 'SupplierUser',
  },
  'DM-AbbGebruiker': {
    description: 'Can view all municipalities.',
    enum: 'AbbUser',
  },
};

export default roleConfig;
