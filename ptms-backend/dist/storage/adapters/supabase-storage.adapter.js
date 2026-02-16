"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseStorageAdapter = class SupabaseStorageAdapter {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
            this.configService.get('SUPABASE_KEY');
        this.bucketName = this.configService.get('SUPABASE_BUCKET') || 'documents';
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_KEY in .env');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    async upload(file, options) {
        let fileBuffer;
        if (Buffer.isBuffer(file)) {
            fileBuffer = file;
        }
        else if ('buffer' in file && file.buffer) {
            fileBuffer = Buffer.from(file.buffer);
        }
        else if ('path' in file && file.path) {
            const fs = require('fs');
            fileBuffer = fs.readFileSync(file.path);
        }
        else {
            throw new Error('Invalid file format');
        }
        const filePath = `${options.directory}/${options.filename}`;
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, fileBuffer, {
            contentType: options.contentType || 'application/pdf',
            upsert: true,
            metadata: options.metadata,
        });
        if (error) {
            throw new Error(`Supabase upload failed: ${error.message}`);
        }
        const { data: urlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);
        return {
            url: urlData.publicUrl,
            path: filePath,
            provider: 'supabase',
            metadata: Object.assign({ bucketId: data.id, fullPath: data.path, size: fileBuffer.length }, options.metadata),
        };
    }
    async download(filePath) {
        console.log(`[SupabaseStorage] Attempting to download: ${filePath} from bucket: ${this.bucketName}`);
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .download(filePath);
        if (error) {
            console.error('[SupabaseStorage] Download error details:', {
                filePath,
                bucket: this.bucketName,
                error: error,
                errorMessage: error.message,
                errorName: error.name,
                fullError: JSON.stringify(error, null, 2)
            });
            throw new Error(`Supabase download failed for "${filePath}": ${error.message || error.name || JSON.stringify(error)}`);
        }
        if (!data) {
            console.error('[SupabaseStorage] No data returned for:', filePath);
            throw new Error(`Supabase download returned no data for "${filePath}"`);
        }
        console.log(`[SupabaseStorage] Successfully downloaded: ${filePath}`);
        return Buffer.from(await data.arrayBuffer());
    }
    async delete(filePath) {
        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .remove([filePath]);
        if (error) {
            throw new Error(`Supabase delete failed: ${error.message}`);
        }
    }
    async exists(filePath) {
        try {
            const pathParts = filePath.split('/');
            const filename = pathParts.pop();
            const directory = pathParts.join('/');
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list(directory || '');
            if (error)
                return false;
            return data.some((file) => file.name === filename);
        }
        catch (_a) {
            return false;
        }
    }
    async getUrl(filePath, expiresIn) {
        if (expiresIn) {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .createSignedUrl(filePath, expiresIn);
            if (error) {
                throw new Error(`Failed to generate signed URL: ${error.message}`);
            }
            return data.signedUrl;
        }
        const { data } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);
        return data.publicUrl;
    }
    getProviderName() {
        return 'supabase';
    }
};
exports.SupabaseStorageAdapter = SupabaseStorageAdapter;
exports.SupabaseStorageAdapter = SupabaseStorageAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseStorageAdapter);
//# sourceMappingURL=supabase-storage.adapter.js.map