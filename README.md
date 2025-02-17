# Prompt Buddy - Your AI Prompt Enhancement Companion

Prompt Buddy is a Chrome extension that helps you craft better prompts for AI platforms like ChatGPT, Claude, and Perplexity. It provides real-time suggestions to improve your prompts before sending them to the AI.

![Prompt Buddy Icon](src/assets/robot.png)

## Features

- 🎯 **Smart Prompt Analysis**: Analyzes your prompts in real-time for clarity, specificity, context, and format
- 🔄 **Instant Rewrite Suggestions**: Offers improved versions of your prompts with explanations
- 🎨 **Tone Detection**: Identifies the current tone of your prompt and suggests improvements
- 💡 **Context Enhancement**: Provides suggestions to add relevant context and improve coherence
- 🌐 **Multi-Platform Support**: Works seamlessly with:
  - ChatGPT
  - Claude
  - Perplexity

## How It Works

1. The extension adds a small robot icon next to the chat input box on supported AI platforms
2. As you type your prompt, click the robot icon to open the Prompt Buddy interface
3. Prompt Buddy analyzes your input and provides:
   - Tone suggestions
   - Clarity improvements
   - Specificity enhancements
   - Context recommendations
   - Format optimization
4. Select the suggestions you want to incorporate
5. Click "Rewrite" to update your prompt with the selected improvements

## Installation

1. Install the extension from the Chrome Web Store (link coming soon)
2. Navigate to any supported AI platform (ChatGPT, Claude, or Perplexity)
3. Look for the Prompt Buddy robot icon next to the chat input box

## Usage Tips

- Click the robot icon whenever you want to improve your prompt
- Consider the tone suggestions to match your intended communication style
- Use the specificity suggestions to get more precise responses
- Add recommended context to help the AI better understand your needs
- Try the rewritten versions for more effective prompts

## Technical Details

The extension uses:
- React with TypeScript for the frontend
- AWS Lambda for prompt analysis
- OpenAI's GPT-4 for generating intelligent suggestions
- Antd for the UI components

## Privacy

- The extension only activates on supported AI platforms
- Only analyzes the text you're actively working on
- No data is stored or collected
- All processing happens in real-time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details
