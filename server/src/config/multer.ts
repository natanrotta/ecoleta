import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
    //__dirname retorna o caminho nosso do arquivo, outros parametros é a navegação até a pasta aonde vou armazenar as imagens que o user subiu.
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads'),
        filename(request, file, callback){
            //Crio o hash de tamanho 6
            const hash = crypto.randomBytes(6).toString('hex');

            //Crio o nome do arquivo hash + nome original
            const fileName = `${hash}-${file.originalname}`;

            //Primeiro parametro é erro
            callback(null, fileName)
        }
    }),
}