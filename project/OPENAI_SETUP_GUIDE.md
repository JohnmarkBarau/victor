# OpenAI API Setup Guide

## Step 1: Get Your OpenAI API Key

1. **Go to OpenAI Platform**: Visit [https://platform.openai.com](https://platform.openai.com)

2. **Sign Up/Login**: Create an account or log in if you already have one

3. **Navigate to API Keys**: 
   - Click on your profile in the top right
   - Select "View API keys" or go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. **Create New Key**:
   - Click "Create new secret key"
   - Give it a name like "SocialSync AI"
   - Copy the key immediately (you won't see it again!)

5. **Add Billing**: 
   - Go to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
   - Add a payment method
   - Set a usage limit (start with $5-10 for testing)

## Step 2: Add to Your Environment

1. **Open your `.env` file** in the project root
2. **Add this line**:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. **Save the file**

## Step 3: Test the Integration

Once you've added the API key:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test AI Content Generation**:
   - Go to "Create Post" page
   - Click on "AI Assist" tab
   - Enter a topic like "social media tips"
   - Click "Generate Content"
   - You should see AI-generated content appear!

3. **Test Auto-Reply**:
   - Go to "Comment Management" page
   - If you have sample comments, click "Generate Reply"
   - You should see AI-generated replies!

## What This Enables

✅ **AI Content Generation** - Create posts with AI assistance
✅ **Auto-Reply System** - Generate replies to comments automatically  
✅ **Content Suggestions** - Get AI-powered content recommendations
✅ **Smart Calendar** - AI suggests optimal posting times and content

## Pricing

- **Free Credits**: New accounts get $5 in free credits
- **Cost**: ~$0.002 per 1,000 tokens (very affordable)
- **Example**: Generating 100 social media posts ≈ $0.50

## Troubleshooting

**If AI features don't work:**

1. **Check your API key**: Make sure it starts with `sk-`
2. **Restart the server**: Stop and start `npm run dev`
3. **Check billing**: Ensure you have credits/billing set up
4. **Check browser console**: Look for any error messages

**Common Issues:**

- **"API key not configured"**: Add the key to `.env` file
- **"Insufficient quota"**: Add billing to your OpenAI account
- **"Invalid API key"**: Double-check the key is correct

## Next Steps

Once OpenAI is working:

1. **Test all AI features** in the app
2. **Set up Twitter API** for your first social media connection
3. **Add Instagram API** for reading posts and analytics
4. **Configure other platforms** as needed

## Security Note

- **Never commit your `.env` file** to version control
- **Keep your API keys secret**
- **Set usage limits** to prevent unexpected charges