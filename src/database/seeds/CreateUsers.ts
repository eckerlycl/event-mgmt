import { Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';

import { User } from '../../../src/api/models/User';

export class CreateUsers {

    public async seed(factory: Factory, connection: Connection): Promise<any> {
        await factory(User)().seedMany(10);
    }

}
