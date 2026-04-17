import { CREDENTIALS } from '../data/credentials';

const AuthService = {
  validate: async (user, pass) => {
    // Busca real nas credenciais do arquivo de dados preservado
    for (const provider in CREDENTIALS) {
      const accounts = CREDENTIALS[provider].accounts;
      if (Array.isArray(accounts)) {
          const match = accounts.find(acc => acc.user === user && acc.pass === pass);
          if (match) return { success: true, provider };
      }
    }
    return { success: false };
  },
  getVersion: () => "4.2.0"
};

export default AuthService;
