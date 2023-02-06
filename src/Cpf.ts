export default class Cpf {
  private static readonly CPF_MATCH = /(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{1,2})/;
  private readonly cpfValue: string;

  constructor(cpfValue: string) {
    const parts = Cpf.CPF_MATCH.exec(cpfValue);
    if (!parts) {
      throw new Error(`value ${cpfValue} does not match CPF format`);
    }
    this.cpfValue = `${parts[1]}.${parts[2]}.${parts[3]}-${parts[4].padStart(2, '0')}`;

    const { digits, verificationDigits } = this.getCpfDigitsFromMatch(parts);

    if ([...digits, ...verificationDigits].every((digit) => digit === digits[0])) {
      throw new Error('Invalid CPF string');
    }
    if (this.getVerificationDigit(digits) !== verificationDigits[0]) {
      throw new Error('Invalid CPF string');
    }
    if (this.getVerificationDigit([...digits, verificationDigits[0]]) !== verificationDigits[1]) {
      throw new Error('Invalid CPF string');
    }
  }

  toString() {
    return this.cpfValue;
  }

  private getCpfDigitsFromMatch(match: RegExpMatchArray): {
    digits: readonly number[];
    verificationDigits: readonly [number, number];
  } {
    const digits = [...match[1], ...match[2], ...match[3]].map((strDigit) => +strDigit);
    const verificationDigits: [number, number] = [0, 0];

    if (match[4].length == 1) {
      verificationDigits[1] = +match[4][0];
    } else {
      const [a, b] = match[4];
      verificationDigits[0] = +a;
      verificationDigits[1] = +b;
    }
    return { digits, verificationDigits };
  }

  private getVerificationDigit(digits: readonly number[]) {
    const baseMultiplier = 2;

    let sumResult = 0;
    for (let reverseIteratorIndex = digits.length - 1; reverseIteratorIndex >= 0; reverseIteratorIndex--) {
      const digit = digits[reverseIteratorIndex];
      const multiplier = digits.length - (reverseIteratorIndex + 1) + baseMultiplier;

      sumResult += digit * multiplier;
    }

    const remainder = sumResult % 11;
    if (remainder < 2) {
      return 0;
    }
    return 11 - remainder;
  }
}
