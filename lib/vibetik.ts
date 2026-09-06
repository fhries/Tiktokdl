import axios from "axios";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DEFAULT_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": USER_AGENT,
};

interface TikTokAuthor {
  unique_id?: string;
  nickname?: string;
}

interface TikTokInfo {
  id?: string;
  title?: string;
  desc?: string;

  author?: TikTokAuthor;

  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;

  play?: string;
  hdplay?: string;

  [key: string]: unknown;
}

interface TikTokApiResponse {
  code?: number;
  msg?: string;
  message?: string;
  data?: TikTokInfo;
}

export class VibeTikScraper {
  /**
   * Mengambil informasi TikTok dari endpoint VibeTik.
   */
  async getVideoInfo(tiktokUrl: string): Promise<TikTokInfo> {
    if (!tiktokUrl) {
      throw new Error("URL TikTok wajib diisi.");
    }

    const endpoint = Buffer.from(
      "aHR0cHM6Ly93d3cudGlrd20uY29tL2FwaS8=",
      "base64"
    ).toString("utf8");

    try {
      const response = await axios.get<TikTokApiResponse>(
        endpoint,
        {
          params: {
            url: tiktokUrl,
          },

          headers: DEFAULT_HEADERS,

          timeout: 30000,

          validateStatus: (status) =>
            status >= 200 && status < 300,
        }
      );

      const body = response.data;

      if (!body || body.code !== 0) {
        throw new Error(
          body?.msg ||
            body?.message ||
            "API TikTok mengembalikan response gagal."
        );
      }

      if (!body.data) {
        throw new Error(
          "Data TikTok tidak ditemukan dalam response."
        );
      }

      return body.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            `Gagal mengambil data TikTok: HTTP ${error.response.status}`
          );
        }

        if (error.code === "ECONNABORTED") {
          throw new Error(
            "Request TikTok timeout."
          );
        }

        throw new Error(
          `Gagal terhubung ke API TikTok: ${
            error.message
          }`
        );
      }

      throw error;
    }
  }

  /**
   * Mendapatkan URL video berdasarkan kualitas.
   *
   * Prioritas:
   * HD     -> hdplay lalu play
   * Normal -> play lalu hdplay
   */
  async getSignedDownloadUrl(
    tiktokUrl: string,
    quality: "hd" | "normal" = "hd"
  ) {
    const info = await this.getVideoInfo(
      tiktokUrl
    );

    const videoUrl =
      quality === "hd"
        ? this.getString(info.hdplay) ||
          this.getString(info.play)
        : this.getString(info.play) ||
          this.getString(info.hdplay);

    if (!videoUrl) {
      throw new Error(
        `URL video ${
          quality === "hd"
            ? "HD"
            : "normal"
        } tidak tersedia dari API.`
      );
    }

    const author =
      this.getString(
        info.author?.unique_id
      ) || "tiktok";

    const id =
      this.getString(info.id) ||
      String(Date.now());

    return {
      signedUrl: videoUrl,

      filename:
        `${this.sanitizeFilename(author)}-` +
        `${this.sanitizeFilename(id)}.mp4`,

      info,
    };
  }

  /**
   * Memastikan value benar-benar string.
   */
  private getString(
    value: unknown
  ): string | null {
    if (
      typeof value !== "string" ||
      !value.trim()
    ) {
      return null;
    }

    return value.trim();
  }

  /**
   * Membersihkan nama file agar aman.
   */
  private sanitizeFilename(
    value: string
  ): string {
    return value
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 100);
  }
}
