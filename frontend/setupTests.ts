import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(globalThis, { TextEncoder, TextDecoder });

window.scrollBy = jest.fn();
window.scrollTo = jest.fn();
