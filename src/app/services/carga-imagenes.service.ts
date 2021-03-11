import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase';
import { FileItem } from '../models/file-item';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  private CARPETA_IMAGENES = 'img';
  constructor(private db: AngularFirestore, public router: Router) { }

  cargarImagenesFirebase(imagenes: FileItem[]){
    // console.log(imagenes);
    const storageRef = firebase.storage().ref();
    for (const item of imagenes) {
        item.estaSubiendo = true;
        if (item.progreso >= 100) {
          continue;
        }
        const upLoadTask: firebase.storage.UploadTask =
          storageRef.child(`${this.CARPETA_IMAGENES}/${item.nombreArchivo}`)
                    .put(item.archivo);
        upLoadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot: firebase.storage.UploadTaskSnapshot) => item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            , (error: any) => console.error('Error al Subir', error),
            async () => {
              console.log('Imagen cargada correctamente');
              Swal.fire({
                icon: 'success',
                title: 'Se guardó Correctamente',
                showConfirmButton: false,
                timer: 1500
              });
              this.irComponentFotos();
              item.url =  await upLoadTask.snapshot.ref.getDownloadURL().then(ref => ref);
              item.estaSubiendo = false;
              this.guardarImagen({
                nombre: item.nombreArchivo,
                url: item.url
              });
            }


          );
    }

  }
  private guardarImagen(imagen: {nombre: string, url: string}): void{
    this.db.collection(`/${this.CARPETA_IMAGENES}`)
      .add(imagen);
  }
  irComponentFotos(): void{
    this.router.navigate(['/fotos']);
  }
}
