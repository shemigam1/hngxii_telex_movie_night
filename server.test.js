import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';
import app from './server.js';

dotenv.config();

describe('Movie Night API Tests', () => {
    it('should return a success message on GET /', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Telex integration is up and active!');
    });

    it('should return integration metadata on GET /integration.json', async () => {
        const res = await request(app).get('/integration.json');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('descriptions');
        expect(res.body.data.descriptions).toHaveProperty('app_name', 'Movie Night');
    });

    it('should accept the request on POST /tick', async () => {
        const res = await request(app).post('/tick');
        expect(res.status).toBe(202);
        expect(res.body).toHaveProperty('status', 'accepted');
    });

    it('should fetch movie data successfully', async () => {
        const mockResponse = {
            results: [
                { title: "Movie 1" },
                { title: "Movie 2" }
            ]
        };

        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockResponse)
        });

        const { fetchExternalData } = await import('./server.js');
        await fetchExternalData();

        expect(global.fetch).toHaveBeenCalled();
    });
});
