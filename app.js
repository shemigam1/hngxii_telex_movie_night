import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import { configDotenv } from 'dotenv';
import { formatData } from './utils';

const app = express();
app.use(bodyParser.json());


app.get('/integration.json', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.json({
        data: {
            descriptions: {
                app_name: "Movie Night",
                app_description: "Fetches a list of movies from an external API at intervals",
                app_url: baseUrl,
                app_logo: "https://i.imgur.com/lZqvffp.png",
                background_color: "#fff"
            },
            integration_type: "interval",
            settings: [
                { label: "interval", type: "text", required: true, default: '0 18 * * *' }
            ],
            tick_url: `${baseUrl}/tick`
        }
    });
});

async function fetchExternalData() {
    try {
        const options = {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.MOVIE_API_KEY}`
            }
        }
        const url = "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&page=1"
        const res = await axios.get(url, options)

        const data = res.data.results
        const returnData = formatData(data)
        console.log("Fetched Data:", res.data);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

cron.schedule('0 18 * * *', fetchExternalData);

app.post('/tick', (req, res) => {
    fetchExternalData();
    res.status(202).json({ status: "accepted" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
