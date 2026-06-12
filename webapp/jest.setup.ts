import "@testing-library/jest-dom";

// jsdom doesn't include TextEncoder/TextDecoder — polyfill for Prisma/crypto deps
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
