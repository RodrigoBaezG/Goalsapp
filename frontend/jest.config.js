export default {
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/fileMock.js',
        '\\/config\\.js$': '<rootDir>/__mocks__/configMock.js',
    },
    testMatch: [
        '**/__tests__/**/*.?(m)[jt]s?(x)',
        '**/?(*.)+(spec|test).?(m)[jt]s?(x)',
    ],
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/e2e/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
