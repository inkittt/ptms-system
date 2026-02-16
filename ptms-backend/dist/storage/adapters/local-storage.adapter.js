"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LocalStorageAdapter = class LocalStorageAdapter {
    constructor(configService) {
        this.configService = configService;
        this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
        this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
    }
    async upload(file, options) {
        const dir = path.join(this.uploadDir, options.directory);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, options.filename);
        let fileBuffer;
        if (Buffer.isBuffer(file)) {
            fileBuffer = file;
        }
        else if ('path' in file && file.path) {
            fileBuffer = fs.readFileSync(file.path);
        }
        else if ('buffer' in file && file.buffer) {
            fileBuffer = Buffer.from(file.buffer);
        }
        else {
            throw new Error('Invalid file format');
        }
        fs.writeFileSync(filePath, fileBuffer);
        return {
            url: `${this.baseUrl}/uploads/${options.directory}/${options.filename}`,
            path: filePath,
            provider: 'local',
            metadata: Object.assign({ size: fileBuffer.length, contentType: options.contentType }, options.metadata),
        };
    }
    async download(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }
        return fs.readFileSync(filePath);
    }
    async delete(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    async exists(filePath) {
        return fs.existsSync(filePath);
    }
    async getUrl(filePath, expiresIn) {
        const relativePath = filePath.replace(this.uploadDir, '').replace(/\\/g, '/');
        return `${this.baseUrl}/uploads${relativePath}`;
    }
    getProviderName() {
        return 'local';
    }
};
exports.LocalStorageAdapter = LocalStorageAdapter;
exports.LocalStorageAdapter = LocalStorageAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageAdapter);
//# sourceMappingURL=local-storage.adapter.js.map