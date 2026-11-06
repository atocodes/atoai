import {
    CreateSourceDTO,
    Source,
    SourceFilter,
    SourceStats,
    UpdateSourceDTO,
} from "../interface/source.interface";
import { ISourceRepo, SourceRepo } from "../interface/source.repo.interface";
import { ISourceService } from "../interface/source.service.interface";
import { SourceRepoImpl } from "../repo/source.repo.impl";

export class SourceService implements ISourceService {
    private repo: ISourceRepo;

    constructor(repo?: ISourceRepo) {
        this.repo = repo ?? new SourceRepoImpl();
    }

    private normalizeTelegramIdentifiers(dto: CreateSourceDTO | UpdateSourceDTO) {
        let username = dto.username;
        let url = dto.url;

        // If a t.me URL is provided and username is missing, extract it
        if (url && !username && url.includes("t.me/")) {
            const parts = url.split("t.me/");
            if (parts[1]) {
                const cleanUser = parts[1].split(/[/?#]/)[0].replace(/^@/, "");
                if (cleanUser && !cleanUser.startsWith("+")) {
                    username = cleanUser;
                }
            }
        }

        if (username) {
            username = username.replace(/^@/, "").trim();
            if (!url && username) {
                url = `https://t.me/${username}`;
            }
        }

        return { username, url };
    }

    async create(dto: CreateSourceDTO): Promise<Source> {
        const { username, url } = this.normalizeTelegramIdentifiers(dto);

        const channelId =
            dto.channelId !== undefined && dto.channelId !== null && String(dto.channelId).trim() !== ""
                ? String(dto.channelId).trim()
                : null;

        // Check for existing source with the same channelId
        if (channelId) {
            const existing = await this.repo.findByChannelId(channelId);
            if (existing) {
                throw new Error(`A source with channel ID "${channelId}" already exists (${existing.name || existing.username || existing.id}).`);
            }
        }

        // Check for existing source with same username for Telegram sources
        if (username && (dto.type === "TELEGRAM" || !dto.type)) {
            const existing = await this.repo.findByUsername(username);
            if (existing) {
                throw new Error(`A source with Telegram username "@${username}" already exists (${existing.name || existing.id}).`);
            }
        }

        return this.repo.create({
            ...dto,
            username: username || null,
            url: url || null,
            channelId: channelId || null,
        });
    }

    async update(id: string, dto: UpdateSourceDTO): Promise<Source> {
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new Error(`Source with ID "${id}" was not found.`);
        }

        const { username, url } = this.normalizeTelegramIdentifiers({
            ...existing,
            ...dto,
        });

        const channelId =
            dto.channelId !== undefined
                ? dto.channelId !== null && String(dto.channelId).trim() !== ""
                    ? String(dto.channelId).trim()
                    : null
                : existing.channelId;

        if (channelId && channelId !== existing.channelId) {
            const duplicate = await this.repo.findByChannelId(channelId);
            if (duplicate && duplicate.id !== id) {
                throw new Error(`Another source already uses channel ID "${channelId}".`);
            }
        }

        if (username && username !== existing.username) {
            const duplicate = await this.repo.findByUsername(username);
            if (duplicate && duplicate.id !== id) {
                throw new Error(`Another source already uses Telegram username "@${username}".`);
            }
        }

        return this.repo.update(id, {
            ...dto,
            username: username !== undefined ? username : existing.username,
            url: url !== undefined ? url : existing.url,
            channelId,
        });
    }

    async delete(id: string): Promise<boolean> {
        const existing = await this.repo.findById(id);
        if (!existing) {
            return false;
        }
        return this.repo.delete(id);
    }

    async toggleStatus(id: string): Promise<Source> {
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new Error(`Source with ID "${id}" was not found.`);
        }

        const nextStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        return this.repo.update(id, { status: nextStatus });
    }

    async findById(id: string): Promise<Source | null> {
        return this.repo.findById(id);
    }

    async findByChannelIdOrUsername(
        channelId?: string | null,
        username?: string | null
    ): Promise<Source | null> {
        return this.repo.findByChannelIdOrUsername(channelId, username);
    }

    /**
     * Determine whether an incoming message from a Telegram channel is allowed to be ingested.
     * If the source is registered:
     *   - ACTIVE: allowed
     *   - INACTIVE / ARCHIVED / DELETED: blocked with descriptive reason
     * If not registered:
     *   - Auto-registers the channel as ACTIVE so the admin can immediately see and manage it.
     */
    async isChannelAllowed(
        channelId?: string | null,
        username?: string | null,
        title?: string | null
    ): Promise<{ allowed: boolean; source?: Source; reason?: string }> {
        let source = await this.repo.findByChannelIdOrUsername(channelId, username);

        if (source) {
            if (source.status === "ACTIVE") {
                return { allowed: true, source };
            }
            return {
                allowed: false,
                source,
                reason: `Channel source "${source.name || source.username || channelId}" is currently ${source.status.toLowerCase()}. Ingestion paused.`,
            };
        }

        // Create new active source for unregistered channel
        const newSource = await this.repo.create({
            name: title,
            type: "TELEGRAM",
            status: "ACTIVE",
            channelId,
            username,
            url: username ? `https://t.me/${username}` : undefined,
            description: `Auto-registered channel: ${title || username || channelId}`,
            metadata: { autoRegistered: true },
        });

        return { allowed: true, source: newSource };
    }

    async getActiveSources(): Promise<Source[]> {
        return this.repo.getActiveSources();
    }

    async listSources(filter: SourceFilter): Promise<{
        sources: Source[];
        total: number;
        page: number;
        limit: number;
    }> {
        const page = Math.max(1, filter.page || 1);
        const limit = Math.min(100, Math.max(1, filter.limit || 20));
        const result = await this.repo.list({ ...filter, page, limit });

        return {
            sources: result.sources,
            total: result.total,
            page,
            limit,
        };
    }

    async getStats(): Promise<SourceStats> {
        return this.repo.getStats();
    }
}

export const sourceService = new SourceService();
export default sourceService;
