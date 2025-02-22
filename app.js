import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import { configDotenv } from 'dotenv';
import { formatData } from './utils.js';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/integration.json', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.json({
        data: {
            date: {
                created_at: "2025-02-21",
                updated_at: "2025-02-21"
            },
            descriptions: {
                app_name: "Movie Night",
                app_description: "Fetches a list of movies from an external API at intervals",
                app_url: baseUrl,
                app_logo: "https://i.imgur.com/lZqvffp.png",
                background_color: "#fff"
            },
            integration_category: "Logging",
            integration_type: "interval",
            is_active: true,
            output: [],
            key_features: [
                "Logs a list of popular movies to channel",
            ],
            settings: [
                { label: "interval", type: "text", required: true, default: '0 18 * * *' }
            ],
            tick_url: `${baseUrl}/tick`
        }


    });
});

async function fetchExternalData() {
    try {
        const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
        const options = {
            // method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGViZTIxMGE4NDAxYjRmZmJkOTMwMTY4NGUwZmZhNiIsIm5iZiI6MTczMDQ3NTQ3Mi45NDksInN1YiI6IjY3MjRmNWQwMDFjNGRiZmE5NGY2OGZlYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9Au69kWK40fUkj73Oq5dsa7lJdZ0PIbMW0omIuGm8fg'
            }
        };
        // console.log("Fetching Data...");

        const res = await axios.get(url, options)
        // console.log('error?');

        const data = res.data.results
        const returnData = formatData(data)
        console.log("Fetched Data:", returnData);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

// cron.schedule('0 18 * * *', fetchExternalData);
cron.schedule('* * * * *', fetchExternalData);

app.post('/tick', (req, res) => {
    const data = fetchExternalData();
    res.status(202).json({ status: "accepted" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
