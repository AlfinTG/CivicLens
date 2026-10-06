import qrcode
import sys

def make_qr():
    url = input('Enter your Ngrok Frontend URL (e.g. https://xyz.ngrok.app): ').strip()
    if not url:
        print('URL cannot be empty.')
        return
        
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color='black', back_color='white')
    img.save('presentation_qr.png')
    print(f'\nSuccess! QR code saved as "presentation_qr.png" in your UrbanScan folder.')
    print('You can drag and drop this image right into your presentation slides.')

if __name__ == '__main__':
    make_qr()
