export abstract class UseCase<Input, Output> {
  protected getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return `${fallback}: ${error.message}`;
    }

    return fallback;
  }

  abstract execute(input: Input): Promise<Output>;
}
