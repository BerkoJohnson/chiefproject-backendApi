import * as http from 'http';
import app from './app';
import { CONFIG } from './config/config';

http.createServer(app).listen(CONFIG.PORT, () => {
  console.log('EDEN-API server listening on port ' + CONFIG.PORT);
});
