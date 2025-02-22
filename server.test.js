import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import axios from 'axios';
import app from './app.js';
import { fetchExternalData } from './server.js';

const { expect } = chai;

chai.use(chaiHttp);

describe('Movie Night Integration Tests', function () {
    this.timeout(5000); // Extend timeout for async tests

    // Test the root endpoint
    it('should return a success message from root endpoint', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Telex integration is up and active!');
                done();
            });
    });

    // Test integration.json endpoint
    it('should return integration metadata', (done) => {
        chai.request(app)
            .get('/integration.json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.have.property('descriptions');
                expect(res.body.data.descriptions).to.have.property('app_name', 'Movie Night');
                done();
            });
    });

    // Mock fetchExternalData function
    it('should fetch external data successfully', async function () {
        this.timeout(10000); // API calls might take longer
        const axiosStub = sinon.stub(axios, 'get').resolves({ data: { results: [{ title: 'Movie 1' }, { title: 'Movie 2' }] } });



        await fetchExternalData();

        expect(axiosStub.calledOnce).to.be.true;
        axiosStub.restore();
    });

    // Test tick endpoint (manual trigger)
    it('should trigger fetchExternalData via POST /tick', (done) => {
        chai.request(app)
            .post('/tick')
            .end((err, res) => {
                expect(res).to.have.status(202);
                expect(res.body).to.have.property('status', 'accepted');
                done();
            });
    });
});
