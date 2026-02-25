import express from "express"
import OpenAI  from "openai"
import path from "path"
import * as dotenv from "dotenv"
import { fileURLToPath } from "url";
dotenv.config()
const app=express();
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)


//Authenticate with OpenAI
const openai=new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
})

//pass incoming data
app.use(express.json())

// Serve static files and views
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

// Root route - render frontend
app.get('/', (req, res) => {
    res.render('index')
})

//Route: genrate app idea
app.post("/generate",async(req,res)=>{
try {
    const {customPrompt}=req.body
    if(!customPrompt || !customPrompt.trim())
    {
        return res.status(400).json({
            success:false,
            error:"Please provide a prompt"
        })
    }
    const prompt=`${customPrompt}
   Please provide a comprehensive app idea with the following details:
    1. App name: Creative and catchy.
    2. One line description.
    3. Target audience.
    4. Core features (at least 3-5 key features).
    5. Unique value proposition.
    6. Monetization strategy.
    7. Technology stack suggestions.

    Format the response in clear,structured way
    `
    //Call OpenAI API to generate app idea
    const response=await openai.chat.completions.create({
        model:'gpt-4.1-mini',
        message:[{
            role:'system',
            content:'You are a creative product manager and entrepreneur who generate innovative, practical and unique app ideas.Your ideas are well thought out and consider market viability.Always provide detailed structured response and then bring comma.'
        },
        {
            role:'user',
            content:prompt
        }
    ],
    temperature:0.9,
    max_tokens:1000
    })
    const idea=response.choices[0].message.content
    res.json({
        success:true,
        idea
    })
} catch (error) {
    res.status(500).json({
        success:false,
        error:error
    })
} 
})

const PORT=process.env.PORT||5000
//Server start
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})