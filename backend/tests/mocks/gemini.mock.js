// Mock for @google/generative-ai

const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: () => 'This is a mocked AI response from Gemini'
  }
});

const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent
});

class MockGoogleGenerativeAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  
  getGenerativeModel() {
    return mockGetGenerativeModel();
  }
}

module.exports = {
  GoogleGenerativeAI: MockGoogleGenerativeAI,
  mockGenerateContent,
  mockGetGenerativeModel
};
