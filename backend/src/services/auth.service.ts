import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

class AuthService {
  private hashedPassword: string | null = null;

  async verifyPassword(password: string): Promise<boolean> {
    const hash = await this.getHashedPassword();
    return bcrypt.compare(password, hash);
  }

  private async getHashedPassword(): Promise<string> {
    if (!this.hashedPassword) {
      const raw = process.env.APP_PASSWORD;
      if (!raw) throw new Error("APP_PASSWORD environment variable is required");
      this.hashedPassword = await bcrypt.hash(raw, SALT_ROUNDS);
    }
    return this.hashedPassword;
  }
}

export const authService = new AuthService();
