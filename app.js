import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { formatData } from './utils.js';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.json({ message: 'Telex integration is up and active!' }));


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
            integration_category: "Task Automation",
            integration_type: "interval",
            is_active: true,
            output: [],
            key_features: [
                "Logs a list of popular movies to channel",
            ],
            settings: [
                { label: "interval", type: "text", required: true, default: '0 18 * * *' }
            ],
            tick_url: `${baseUrl}/tick`,
            target_url: "https://ping.telex.im/v1/webhooks/01952f72-bd92-745b-a6a8-46bfbe5f103b"
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
                Authorization: `Bearer ${process.env.MOVIE_API_KEY}`
            }
        };
        // console.log("Fetching Data...");

        const res = await axios.get(url, options)
        // console.log('error?');

        const data = res.data.results
        const returnData = formatData(data)
        const message = `it's Movie Night! Here's a list of popular movies: \n${returnData.join('\n')}`;
        axios.post('https://ping.telex.im/v1/webhooks/01952f72-bd92-745b-a6a8-46bfbe5f103b', {
            message: message,
            username: "Movie Night",
            event_name: "Logger",
            status: "success",
            data: returnData
        });

        // console.log("Fetched Data:", returnData);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

cron.schedule('0 * * * *', fetchExternalData);
// cron.schedule('* * * * *', fetchExternalData);

app.post('/tick', (req, res) => {
    fetchExternalData();
    res.status(202).json({ status: "accepted" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app