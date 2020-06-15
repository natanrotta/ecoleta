import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi'
 
import './styles.css';

//Cria uma interface para receber uma função, que contem o seguinte nome:
interface Props {
    arquivoEnviado: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ arquivoEnviado }) => {



    const [ urlArquivoSelecionado, setUrlArquivoSelecionado ] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const arquivo = acceptedFiles[0];

        const urlAquivo = URL.createObjectURL(arquivo);

        setUrlArquivoSelecionado(urlAquivo);
        arquivoEnviado(arquivo);
        
    }, [arquivoEnviado]);

    const { getRootProps, getInputProps } = useDropzone({ 
        onDrop,
        accept: 'image/*'
    });

    return(
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*"/>

            { urlArquivoSelecionado
                ? <img src={urlArquivoSelecionado} alt="Imagem Ponto" />
                : (
                    <p>
                        <FiUpload />
                        Imagem do estabeleciomento
                    </p>
                )
            }
        </div>
    );
}

export default Dropzone;