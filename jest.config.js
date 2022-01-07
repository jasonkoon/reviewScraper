module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  maxWorkers: 4,
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  verbose: true,
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/' ],
  reporters: ['default'] 
};