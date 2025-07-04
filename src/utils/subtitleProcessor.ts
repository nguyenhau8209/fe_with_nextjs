interface GermanSubtitle {
  text: string;
  startTime: number;
  endTime: number;
  isComplete: boolean;
}

// Kiểu dữ liệu cho mapping giữa câu đã tách và phụ đề gốc
interface SentenceMapping {
  sentence: string;
  startRawIdx: number; // index phụ đề gốc bắt đầu
  endRawIdx: number; // index phụ đề gốc kết thúc
  startCharOffset: number; // offset ký tự bắt đầu trong phụ đề gốc đầu tiên
  endCharOffset: number; // offset ký tự kết thúc trong phụ đề gốc cuối cùng
}

export class GermanSubtitleProcessor {
  private readonly CONNECTORS = [
    "und",
    "oder",
    "aber",
    "denn",
    "weil",
    "da",
    "wenn",
    "falls",
    "obwohl",
    "trotzdem",
    "deshalb",
    "deswegen",
    "darum",
    "dann",
    "nachdem",
    "bevor",
    "während",
    "bis",
    "seit",
    "sodass",
    "damit",
  ];

  private readonly COMMON_VERBS = [
    "ist",
    "sind",
    "war",
    "waren",
    "hat",
    "haben",
    "wird",
    "werden",
    "kann",
    "können",
    "muss",
    "müssen",
    "soll",
    "sollen",
    "möchte",
    "möchten",
    "würde",
    "würden",
    "bin",
    "bist",
    "sei",
    "seien",
    "habe",
    "hätte",
    "hätten",
  ];

  private readonly ENDING_PUNCTUATION = [".", "!", "?", "..."];

  // Các từ viết tắt và trường hợp đặc biệt không nên tách
  private readonly ABBREVIATIONS = [
    "Dr",
    "Prof",
    "Mr",
    "Mrs",
    "Ms",
    "Jr",
    "Sr",
    "etc",
    "usw",
    "bzw",
    "ca",
    "z.B",
    "d.h",
    "u.a",
    "u.s.w",
    "Jan",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
    "Mo",
    "Di",
    "Mi",
    "Do",
    "Fr",
    "Sa",
    "So",
    "Nr",
    "Art",
    "Abs",
    "Bd",
    "S",
    "St",
    "Str",
  ];

  // Điều chỉnh các hằng số thời gian cho tối ưu nghe chép
  private readonly START_BUFFER = 0.8; // Tăng buffer đầu để đảm bảo nghe đủ
  private readonly END_BUFFER = 0.3; // Giảm buffer cuối
  private readonly MIN_DURATION = 1.2;
  private readonly MAX_SINGLE_SENTENCE_DURATION = 10.0; // Tăng thời gian tối đa
  private readonly OVERLAP_BACKWARD = 1.5; // Cho phép lấn ngược về phía trước
  private readonly OVERLAP_FORWARD = 0.2; // Chồng lấn về phía sau nhỏ

  public splitSentences(text: string): string[] {
    // Xử lý trường hợp đặc biệt trước khi tách câu
    let processedText = this.handleSpecialCases(text);

    // Tách câu với regex cải thiện
    let sentences: string[] = processedText.match(/[^.!?]+[.!?]+/g) || [];
    // Đảm bảo đoạn cuối cùng không bị bỏ sót
    const lastMatch = processedText.match(/[^.!?]+$/);
    if (lastMatch && lastMatch[0].trim().length > 0) {
      // Nếu đoạn cuối chưa có trong sentences, thêm vào
      const last = this.restoreSpecialCases(lastMatch[0].trim());
      if (!sentences.map((s) => s.trim()).includes(last)) {
        sentences.push(lastMatch[0].trim());
      }
    }
    // Khôi phục các ký tự đặc biệt đã được thay thế
    return sentences
      .map((sentence) => this.restoreSpecialCases(sentence.trim()))
      .filter((s) => s.length > 0);
  }

  private handleSpecialCases(text: string): string {
    let processed = text;

    // Thay thế tạm thời các trường hợp đặc biệt để tránh tách nhầm
    // Xử lý ngày tháng: 10. Mai 2025, 15. Januar 2024
    processed = processed.replace(
      /(\d{1,2})\.\s*([A-ZÄÖÜ][a-zäöüß]+)\s*(\d{4})/g,
      "$1ⴸ$2 $3"
    );

    // Xử lý số thứ tự: 1. Kapitel, 2. Teil
    processed = processed.replace(
      /(\d{1,2})\.\s*([A-ZÄÖÜ][a-zäöüß]+)/g,
      "$1ⴸ$2"
    );

    // Xử lý các từ viết tắt
    this.ABBREVIATIONS.forEach((abbr) => {
      const regex = new RegExp(`\\b${abbr.replace(".", "\\.")}(?=\\s)`, "gi");
      processed = processed.replace(regex, abbr.replace(".", "ⴸ"));
    });

    // Xử lý số thập phân: 3.14, 10.5
    processed = processed.replace(/(\d+)\.(\d+)/g, "$1ⴸ$2");

    return processed;
  }

  private restoreSpecialCases(text: string): string {
    return text.replace(/ⴸ/g, ".");
  }

  processSubtitles(rawSubtitles: any[]): GermanSubtitle[] {
    if (!rawSubtitles || rawSubtitles.length === 0) {
      console.log("No raw subtitles provided");
      return [];
    }

    console.log("Processing", rawSubtitles.length, "raw subtitles");

    const processedSubtitles: GermanSubtitle[] = [];
    let bufferText = "";
    let bufferStart: number | null = null;
    let bufferEnd: number | null = null;

    for (let i = 0; i < rawSubtitles.length; i++) {
      const current = rawSubtitles[i];

      // Kiểm tra dữ liệu đầu vào - hỗ trợ cả start/end và startTime/endTime
      if (
        !current ||
        typeof current.text !== "string" ||
        (typeof current.start !== "number" &&
          typeof current.startTime !== "number") ||
        (typeof current.end !== "number" && typeof current.endTime !== "number")
      ) {
        console.log("Skipping invalid subtitle:", current);
        continue;
      }

      const text = this.cleanText(current.text);
      if (!text) {
        console.log("Skipping empty text after cleaning:", current.text);
        continue;
      }

      // Lấy thời gian bắt đầu và kết thúc
      const startTime = current.start ?? current.startTime ?? 0;
      const endTime = current.end ?? current.endTime ?? 0;

      // Khởi tạo buffer nếu trống
      if (bufferText === "") {
        bufferStart = Math.max(0, startTime - this.START_BUFFER);
      }

      bufferText += (bufferText ? " " : "") + text;
      bufferEnd = endTime + this.END_BUFFER;

      // Kiểm tra điều kiện để xử lý buffer
      const shouldProcess = this.shouldProcessBuffer(
        bufferText,
        i,
        rawSubtitles
      );

      if (shouldProcess) {
        console.log("Processing buffer:", bufferText.substring(0, 50) + "...");
        this.processBuffer(
          bufferText,
          bufferStart!,
          bufferEnd!,
          processedSubtitles
        );

        // Reset buffer
        bufferText = "";
        bufferStart = null;
        bufferEnd = null;
      }
    }

    // Xử lý buffer cuối cùng nếu còn
    if (bufferText && bufferStart !== null && bufferEnd !== null) {
      console.log(
        "Processing final buffer:",
        bufferText.substring(0, 50) + "..."
      );
      this.processBuffer(
        bufferText,
        bufferStart,
        bufferEnd,
        processedSubtitles
      );
    }

    console.log(
      "Before post-processing, processed subtitles length:",
      processedSubtitles.length
    );

    // Fallback: nếu không có kết quả nào, tạo subtitle đơn giản từ raw data
    if (processedSubtitles.length === 0) {
      console.log("No processed subtitles, creating fallback subtitles");
      return this.createFallbackSubtitles(rawSubtitles);
    }

    return this.postProcessSubtitles(processedSubtitles);
  }

  private createFallbackSubtitles(rawSubtitles: any[]): GermanSubtitle[] {
    const fallbackSubtitles: GermanSubtitle[] = [];

    for (let i = 0; i < rawSubtitles.length; i++) {
      const current = rawSubtitles[i];

      if (
        !current ||
        typeof current.text !== "string" ||
        (typeof current.start !== "number" &&
          typeof current.startTime !== "number") ||
        (typeof current.end !== "number" && typeof current.endTime !== "number")
      ) {
        continue;
      }

      const text = this.cleanText(current.text);
      if (!text) continue;

      const startTime = current.start ?? current.startTime ?? 0;
      const endTime = current.end ?? current.endTime ?? 0;

      fallbackSubtitles.push({
        text: this.ensureProperCapitalization(text),
        startTime: Math.max(0, startTime - 0.5),
        endTime: endTime + 0.5,
        isComplete: true,
      });
    }

    console.log("Created", fallbackSubtitles.length, "fallback subtitles");
    return fallbackSubtitles;
  }

  private shouldProcessBuffer(
    bufferText: string,
    currentIndex: number,
    rawSubtitles: any[]
  ): boolean {
    // Cuối danh sách
    if (currentIndex === rawSubtitles.length - 1) {
      return true;
    }

    // Câu hoàn chỉnh
    if (this.isCompleteSentence(bufferText)) {
      return true;
    }

    // Buffer quá dài (tránh câu quá dài)
    if (bufferText.length > 200) {
      return true;
    }

    // Có nhiều hơn 2 câu trong buffer
    const sentences = this.splitSentences(bufferText);
    if (sentences.length > 2) {
      return true;
    }

    return false;
  }

  private processBuffer(
    bufferText: string,
    bufferStart: number,
    bufferEnd: number,
    processedSubtitles: GermanSubtitle[]
  ): void {
    // Đảm bảo thời gian hợp lệ
    if (bufferEnd <= bufferStart) {
      bufferEnd = bufferStart + this.MIN_DURATION;
    }

    const actualDuration = bufferEnd - bufferStart;
    if (actualDuration < this.MIN_DURATION) {
      bufferEnd = bufferStart + this.MIN_DURATION;
    }

    const sentences = this.splitSentences(bufferText);

    if (sentences.length === 1) {
      // Đơn câu - kiểm tra thời gian tối đa
      const finalEnd = Math.min(
        bufferEnd,
        bufferStart + this.MAX_SINGLE_SENTENCE_DURATION
      );

      processedSubtitles.push({
        text: this.ensureProperCapitalization(sentences[0]),
        startTime: bufferStart,
        endTime: finalEnd,
        isComplete: this.isCompleteSentence(sentences[0]),
      });
    } else {
      // Nhiều câu
      this.distributeSentenceTiming(
        sentences,
        bufferStart,
        bufferEnd,
        processedSubtitles
      );
    }
  }

  private distributeSentenceTiming(
    sentences: string[],
    totalStart: number,
    totalEnd: number,
    processedSubtitles: GermanSubtitle[]
  ): void {
    const totalDuration = totalEnd - totalStart;
    const charCounts = sentences.map((s) => s.length);
    const totalChars = charCounts.reduce((sum, c) => sum + c, 0);

    let currentStart = totalStart;

    for (let i = 0; i < sentences.length; i++) {
      // Tính duration cho câu này dựa trên tỷ lệ ký tự
      let duration = (charCounts[i] / totalChars) * totalDuration;

      // Đảm bảo duration tối thiểu
      if (duration < this.MIN_DURATION) duration = this.MIN_DURATION;

      // Nếu là câu cuối, lấy hết phần còn lại
      let sentenceEnd =
        i === sentences.length - 1
          ? totalEnd
          : Math.min(currentStart + duration, totalEnd);

      // Thêm overlap nhỏ với câu trước (trừ câu đầu)
      if (i > 0) currentStart -= this.OVERLAP_BACKWARD / 2;
      // Thêm overlap nhỏ với câu sau (trừ câu cuối)
      if (i < sentences.length - 1) sentenceEnd += this.OVERLAP_FORWARD;

      // Đảm bảo không vượt quá totalEnd
      if (sentenceEnd > totalEnd) sentenceEnd = totalEnd;

      processedSubtitles.push({
        text: this.ensureProperCapitalization(sentences[i]),
        startTime: Math.max(totalStart, currentStart),
        endTime: sentenceEnd,
        isComplete: this.isCompleteSentence(sentences[i]),
      });

      currentStart = sentenceEnd;
    }
  }

  private calculateSentenceWeight(sentence: string): number {
    const baseLength = sentence.length;
    const wordCount = sentence.split(/\s+/).length;

    // Câu có động từ có trọng số cao hơn
    const hasVerb = this.hasMainVerb(sentence) ? 1.2 : 1.0;

    // Câu có từ nối có trọng số cao hơn (phức tạp hơn)
    const hasConnector = this.startsWithConnector(sentence) ? 1.3 : 1.0;

    return baseLength * hasVerb * hasConnector * Math.log(wordCount + 1);
  }

  private postProcessSubtitles(subtitles: GermanSubtitle[]): GermanSubtitle[] {
    console.log("Post-processing subtitles, input length:", subtitles.length);

    // Nới lỏng điều kiện lọc: chỉ loại bỏ nếu thực sự là rác (dưới 2 ký tự, hoặc thời gian âm)
    const filtered = subtitles.filter(
      (sub) =>
        sub.text.trim().length > 1 &&
        sub.endTime > sub.startTime &&
        sub.endTime - sub.startTime >= 0.2 // cho phép câu ngắn hơn
    );

    console.log("After filtering, length:", filtered.length);
    console.log(
      "Filtered out:",
      subtitles.length - filtered.length,
      "subtitles"
    );

    // Sắp xếp theo thời gian
    filtered.sort((a, b) => a.startTime - b.startTime);

    // Điều chỉnh overlap giữa các subtitle liền kề - Tối ưu cho nghe chép
    for (let i = 0; i < filtered.length - 1; i++) {
      const current = filtered[i];
      const next = filtered[i + 1];

      // Cho phép overlap lớn hơn để đảm bảo nghe đủ nội dung
      // Chỉ điều chỉnh nếu overlap quá lớn (>2 giây)
      if (current.endTime > next.startTime + 2.0) {
        // Điều chỉnh nhẹ để giảm overlap nhưng vẫn đảm bảo nghe được
        const overlap = current.endTime - next.startTime;
        const adjustedOverlap = Math.min(overlap, 1.8); // Tối đa 1.8 giây overlap
        current.endTime = next.startTime + adjustedOverlap;
      }

      // Đảm bảo câu tiếp theo có đủ thời gian tối thiểu
      if (next.endTime - next.startTime < this.MIN_DURATION) {
        next.endTime = next.startTime + this.MIN_DURATION;
      }
    }

    console.log("Final result length:", filtered.length);
    return filtered;
  }

  public ensureProperCapitalization(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  public isCompleteSentence(text: string): boolean {
    const trimmedText = text.trim();
    if (trimmedText.length < 3) return false;
    const hasEndingPunctuation = this.ENDING_PUNCTUATION.some((punct) =>
      trimmedText.endsWith(punct)
    );
    const hasMainVerb = this.hasMainVerb(trimmedText);
    const hasMinimumWords = trimmedText.split(/\s+/).length >= 2;
    const notEndingWithConnector = !this.endsWithConnector(trimmedText);
    const isComplete =
      hasEndingPunctuation &&
      hasMainVerb &&
      hasMinimumWords &&
      notEndingWithConnector;
    if (!isComplete) {
      console.log("Incomplete sentence:", {
        text: trimmedText.substring(0, 50),
        hasEndingPunctuation,
        hasMainVerb,
        hasMinimumWords,
        notEndingWithConnector,
      });
    }
    return isComplete;
  }

  private hasMainVerb(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    return this.COMMON_VERBS.some((verb) => words.includes(verb));
  }

  private startsWithConnector(text: string): boolean {
    const words = text.trim().toLowerCase().split(/\s+/);
    if (words.length === 0) return false;
    return this.CONNECTORS.includes(words[0]);
  }

  private endsWithConnector(text: string): boolean {
    const words = text.trim().toLowerCase().split(/\s+/);
    if (words.length === 0) return false;
    const lastWord = words[words.length - 1].replace(/[.,!?]+$/, "");
    return this.CONNECTORS.includes(lastWord);
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/[^\p{L}\p{N}\s.,!?\-–—]/gu, "")
      .trim();
  }
}

/**
 * Mapping các câu đã tách với phụ đề gốc, trả về thông tin vị trí/offset
 * sentences: mảng câu đã tách
 * rawSubtitles: mảng phụ đề gốc (có text)
 */
export function mapSentencesToRawSubtitles(
  sentences: string[],
  rawSubtitles: any[]
): SentenceMapping[] {
  const mappings: SentenceMapping[] = [];
  let rawIdx = 0;
  let charOffset = 0;

  for (const sentence of sentences) {
    let found = false;
    let startRawIdx = -1,
      endRawIdx = -1;
    let startCharOffset = -1,
      endCharOffset = -1;
    let remaining = sentence.trim();
    let searchOffset = 0;

    // Tìm vị trí bắt đầu của câu trong phụ đề gốc
    for (; rawIdx < rawSubtitles.length; rawIdx++) {
      const rawText = (rawSubtitles[rawIdx].text || "").trim();
      const idx = rawText
        .toLowerCase()
        .indexOf(
          remaining.slice(0, Math.min(10, remaining.length)).toLowerCase()
        );
      if (idx !== -1) {
        startRawIdx = rawIdx;
        startCharOffset = idx;
        found = true;
        break;
      }
    }
    if (!found) {
      // Không tìm thấy, log cảnh báo và gán tạm vào phụ đề gốc hiện tại
      console.warn(
        `[subtitleProcessor] Không mapping được câu: '${sentence.slice(
          0,
          30
        )}...' với phụ đề gốc. Gán tạm vào rawIdx=${rawIdx}`
      );
      startRawIdx = Math.min(rawIdx, rawSubtitles.length - 1);
      startCharOffset = 0;
    }
    // Tìm vị trí kết thúc của câu trong phụ đề gốc
    let endFound = false;
    for (let j = startRawIdx; j < rawSubtitles.length; j++) {
      const rawText = (rawSubtitles[j].text || "").trim();
      const idx = rawText
        .toLowerCase()
        .indexOf(
          remaining.slice(-Math.min(10, remaining.length)).toLowerCase()
        );
      if (idx !== -1) {
        endRawIdx = j;
        endCharOffset = idx + Math.min(10, remaining.length);
        endFound = true;
        break;
      }
    }
    if (!endFound) {
      endRawIdx = startRawIdx;
      endCharOffset = startCharOffset + sentence.length;
      console.warn(
        `[subtitleProcessor] Không mapping được đoạn cuối của câu: '${sentence.slice(
          -30
        )}...' với phụ đề gốc.`
      );
    }
    mappings.push({
      sentence,
      startRawIdx,
      endRawIdx,
      startCharOffset,
      endCharOffset,
    });
  }
  return mappings;
}

/**
 * Nội suy start/end time cho từng câu dựa trên mapping và phụ đề gốc
 * mapping: thông tin mapping của câu
 * rawSubtitles: mảng phụ đề gốc (có start/end)
 */
export function interpolateTimingForSentence(
  mapping: SentenceMapping,
  rawSubtitles: any[]
): { startTime: number; endTime: number } {
  const { startRawIdx, endRawIdx, startCharOffset, endCharOffset } = mapping;
  const startSub = rawSubtitles[startRawIdx];
  const endSub = rawSubtitles[endRawIdx];
  // Nếu câu nằm trọn trong một phụ đề gốc
  if (startRawIdx === endRawIdx) {
    const rawText = (startSub.text || "").trim();
    const totalChars = rawText.length;
    const relStart = startCharOffset / totalChars;
    const relEnd = Math.min(1, endCharOffset / totalChars);
    const startTime =
      (startSub.start ?? startSub.startTime ?? 0) +
      relStart *
        ((startSub.end ?? startSub.endTime ?? 0) -
          (startSub.start ?? startSub.startTime ?? 0));
    const endTime =
      (startSub.start ?? startSub.startTime ?? 0) +
      relEnd *
        ((startSub.end ?? endSub.endTime ?? 0) -
          (startSub.start ?? startSub.startTime ?? 0));
    return { startTime, endTime };
  } else {
    // Câu trải qua nhiều phụ đề gốc
    const startRawText = (startSub.text || "").trim();
    const endRawText = (endSub.text || "").trim();
    const startTotal = startRawText.length;
    const endTotal = endRawText.length;
    const relStart = startCharOffset / startTotal;
    const relEnd = Math.min(1, endCharOffset / endTotal);
    const startTime =
      (startSub.start ?? startSub.startTime ?? 0) +
      relStart *
        ((startSub.end ?? startSub.endTime ?? 0) -
          (startSub.start ?? startSub.startTime ?? 0));
    const endTime =
      (endSub.start ?? endSub.startTime ?? 0) +
      relEnd *
        ((endSub.end ?? endSub.endTime ?? 0) -
          (endSub.start ?? endSub.startTime ?? 0));
    return { startTime, endTime };
  }
}

/**
 * Pipeline hoàn chỉnh: Tách câu, mapping với phụ đề gốc, nội suy timing, trả về mảng subtitle hoàn chỉnh.
 * Có thể test độc lập với rawSubtitles đầu vào.
 */
export function processSubtitlesWithMapping(rawSubtitles: any[]): {
  rawSubtitles: any[];
  processedSubtitles: GermanSubtitle[];
} {
  if (!rawSubtitles || rawSubtitles.length === 0)
    return { rawSubtitles: [], processedSubtitles: [] };

  // Ghép toàn bộ text phụ đề gốc lại để tách câu
  const fullText = rawSubtitles.map((s) => s.text).join(" ");

  // Sử dụng logic tách câu đã có (hoặc thay bằng NLP nếu muốn)
  const processor = new GermanSubtitleProcessor();
  const sentences = processor.splitSentences(fullText);

  // Mapping từng câu với phụ đề gốc
  const mappings = mapSentencesToRawSubtitles(sentences, rawSubtitles);

  // Nội suy timing cho từng câu
  const processedSubtitles: GermanSubtitle[] = mappings.map((mapping) => {
    const { startTime, endTime } = interpolateTimingForSentence(
      mapping,
      rawSubtitles
    );
    return {
      text: processor.ensureProperCapitalization(mapping.sentence),
      startTime,
      endTime,
      isComplete: processor.isCompleteSentence(mapping.sentence),
    };
  });

  return { rawSubtitles, processedSubtitles };
}
