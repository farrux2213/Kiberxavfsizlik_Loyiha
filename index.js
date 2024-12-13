class A51Cipher {
  constructor(key) {
    /**
     * A5/1 shifrlash algoritmini 64-bitli kalit bilan inicializatsiya qilish.
     * @param {string} key - 64-bitli ikkilik satr (binar satr)
     */
    if (key.length !== 64) {
      throw new Error("Kalit 64 bitli bo'lishi kerak.");
    }

    // Kalitni bo‘lib olish: LFSR1 (19 bit), LFSR2 (22 bit), LFSR3 (23 bit)
    this.initialLfsr1 = key.slice(0, 19).split("").map(Number); // LFSR1: 19 bit
    this.initialLfsr2 = key.slice(19, 41).split("").map(Number); // LFSR2: 22 bit
    this.initialLfsr3 = key.slice(41).split("").map(Number); // LFSR3: 23 bit

    // Ishlash uchun LFSRlarni boshlang'ich holatiga qaytarish
    this.reset();

    // Feed-back uchun teskari bitlar (tap positions)
    this.taps = {
      lfsr1: [13, 16, 17, 18], // LFSR1 uchun feed-back pozitsiyalari
      lfsr2: [20, 21], // LFSR2 uchun feed-back pozitsiyalari
      lfsr3: [7, 20, 21, 22], // LFSR3 uchun feed-back pozitsiyalari
    };

    // Ko‘pchilik ovoz (majority voting) uchun bit pozitsiyalari
    this.majorityBits = [8, 10, 10]; // LFSR bitlari
  }

  reset() {
    /**
     * LFSRlarni boshlang'ich holatiga qaytarish.
     */
    this.lfsr1 = [...this.initialLfsr1];
    this.lfsr2 = [...this.initialLfsr2];
    this.lfsr3 = [...this.initialLfsr3];
  }

  majorityVote() {
    /**
     * LFSRlarning clocking bitlari bo‘yicha ko‘pchilik ovozini hisoblash.
     */
    const bits = [
      this.lfsr1[this.majorityBits[0]],
      this.lfsr2[this.majorityBits[1]],
      this.lfsr3[this.majorityBits[2]],
    ];
    return bits.reduce((a, b) => a + b) > 1 ? 1 : 0;
  }

  step() {
    /**
     * LFSRlarni ko‘pchilik ovozi bo‘yicha bir qadam ilgari surish va 1 bitlik kalit oqimini yaratish.
     */
    const majority = this.majorityVote();

    // Har bir LFSRni clocking bitiga qarab yangilash
    if (this.lfsr1[this.majorityBits[0]] === majority) {
      const feedback = this.taps.lfsr1.reduce(
        (acc, pos) => acc ^ this.lfsr1[pos],
        0
      );
      this.lfsr1 = [feedback, ...this.lfsr1.slice(0, -1)];
    }

    if (this.lfsr2[this.majorityBits[1]] === majority) {
      const feedback = this.taps.lfsr2.reduce(
        (acc, pos) => acc ^ this.lfsr2[pos],
        0
      );
      this.lfsr2 = [feedback, ...this.lfsr2.slice(0, -1)];
    }

    if (this.lfsr3[this.majorityBits[2]] === majority) {
      const feedback = this.taps.lfsr3.reduce(
        (acc, pos) => acc ^ this.lfsr3[pos],
        0
      );
      this.lfsr3 = [feedback, ...this.lfsr3.slice(0, -1)];
    }

    // Keystream bitini olish (har bir LFSRning oxirgi bitini XOR qilish orqali)
    return this.lfsr1.at(-1) ^ this.lfsr2.at(-1) ^ this.lfsr3.at(-1);
  }

  generateKeystream(length) {
    /**
     * Berilgan uzunlikdagi kalit oqimini yaratish.
     * @param {number} length - Yaratiladigan bitlar soni
     * @return {number[]} Keystream (bitlar ro‘yxati)
     */
    return Array.from({ length }, () => this.step());
  }

  encrypt(plaintext) {
    /**
     * Ochiq matnni kalit oqimi yordamida shifrlash.
     * @param {string} plaintext - Ochiq matn (0 va 1'lar bilan yozilgan satr)
     * @return {string} Shifrlangan matn (0 va 1'lar bilan yozilgan satr)
     */
    this.reset(); // LFSRlarni qayta boshlash
    const plaintextBits = plaintext.split("").map(Number);
    const keystream = this.generateKeystream(plaintextBits.length);
    return plaintextBits.map((bit, i) => bit ^ keystream[i]).join("");
  }

  decrypt(ciphertext) {
    /**
     * Shifrlangan matnni kalit oqimi yordamida deshifrlash (shifrlash bilan bir xil jarayon).
     * @param {string} ciphertext - Shifrlangan matn (0 va 1'lar bilan yozilgan satr)
     * @return {string} Ochiq matn (0 va 1'lar bilan yozilgan satr)
     */
    return this.encrypt(ciphertext); // XOR qilish orqali asl matnni qaytarish
  }
}

// Misol uchun foydalanish
const key = "1101001110111100100101101101111010100100111101111010010011011010"; // 64-bitli kalit
const plaintext = "10101010101010101010101010101010101010101010101"; // Ochiq matn (binar satr)

const cipher = new A51Cipher(key); // Klassni yaratish
const ciphertext = cipher.encrypt(plaintext); // Shifrlash
const decrypted = cipher.decrypt(ciphertext); // Deshifrlash

// Natijalarni chiqarish
console.log("Ochiq matn: ", plaintext); // Ochiq matn
console.log("Shifrlangan matn:", ciphertext); // Shifrlangan matn
console.log("Deshifrlangan matn: ", decrypted); // Deshifrlangan matn (asl matn bilan bir xil bo'lishi kerak)
