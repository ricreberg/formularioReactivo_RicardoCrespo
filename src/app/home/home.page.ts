import { Component, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonList,
  IonItem,
  IonButton,
  IonSpinner
} from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonList,
    IonItem,
    IonButton,
    IonSpinner,
    ReactiveFormsModule
  ],
})
export class HomePage {
  public registroForm: FormGroup;
  public isSubmitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]
      ]
    });
  }
  public async onSubmit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.registroForm.value;
      console.log('Payload a enviar a la API REST:', formData);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      });

      this.registroForm.reset();
    } catch (error) {
      console.error('Error durante el envío simulado:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
