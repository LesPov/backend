const VERIFICATION_CODE_EXPIRATION_MINUTES = 1;

// En utils.ts
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  // En un archivo de utilidad, por ejemplo, generateVerification.ts
