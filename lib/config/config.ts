interface ICongig {
    PORT: number;
    SECRET: string;
    DB_URL: string;
}

export const CONFIG:ICongig = {
    PORT: 5021,
    SECRET: 'chiefeden01',
    DB_URL: 'edenDB'
}
