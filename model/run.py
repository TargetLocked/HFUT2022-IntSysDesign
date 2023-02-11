import os, sys
from PIL import Image, ImageFilter
from siamese import Siamese
model = Siamese()

def get_img(img_path):
    img = Image.open(img_path)
    img = img.filter(ImageFilter.MedianFilter(3))
    img= img.filter(ImageFilter.SMOOTH)
    img = img.filter(ImageFilter.ModeFilter)
    return img

def predict(file1,file2):
    img1 = get_img(file1) 
    img2 = get_img(file2)
    
    probability = model.detect_image(img1,img2).item()
    return round(probability,3)

    # return 0.2

def main(to_pred_dir,result_save_path):
    subdirs = os.listdir(to_pred_dir) # name
    labels = []
    for subdir in subdirs:
        result = predict(os.path.join(to_pred_dir,subdir,"a.jpg"),os.path.join(to_pred_dir,subdir,"b.jpg"))
        labels.append(result)
    fw = open(result_save_path,"w")
    fw.write("id,label\n")
    for subdir,label in zip(subdirs,labels):
        fw.write("{},{}\n".format(subdir,label))
    fw.close()

if __name__ == "__main__":
    to_pred_dir = sys.argv[1]
    result_save_path = sys.argv[2]
    main(to_pred_dir, result_save_path)