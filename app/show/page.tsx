'use client';

import { Carousel } from '@material-tailwind/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getFaces } from '../actions/getFaces';
import FaceDetectionImage from '@/component/Image';
import { Face, Photo } from '@/model/Photo';
import assert from 'assert';

export default function Page() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    function genPhoto(faces: Face[]) {
      let photos: Photo[] = [];

      faces.forEach((face) => {
        const photo = photos.find((p) => p.file_id === face.file_id);
        if (photo) {
          photo.faces.push(face);
        } else {
          photos.push({
            file_id: face.file_id,
            file_name: face.file_name,
            faces: [face],
          });
        }
      });

      // 排序：根据 last face 的 checkin_time 从大到小
      // photos.sort((a, b) => b.faces.length - a.faces.length);
      photos.sort((a, b) => {
        assert(a.faces.length > 0 && b.faces.length > 0);
        const a_time = a.faces[a.faces.length - 1].checkin_time;
        const b_time = b.faces[b.faces.length - 1].checkin_time;
        if (a_time > b_time) {
          // a 比 b 更新（更大）
          return -1;
        }
        return 1;
      });

      // 切片：只选取前 9 张图片进行轮播
      photos = photos.slice(0, 9);

      photos.reverse();

      // console.log('====================================');
      // photos.forEach((photo) => {
      //   console.log(photo.faces[photo.faces.length - 1].checkin_time);
      // });
      // console.log('====================================');

      // 头插默认图片
      photos.unshift({
        id: -1,
        file_id: '-1',
        file_name: '/default.jpeg',
        faces: [],
      } as Photo);

      setPhotos(photos);
    }

    const fetchFaces = async () => {
      try {
        const rsp = await getFaces();
        genPhoto(rsp);
      } catch (e) {
        console.error('Error fetching faces:', e);
      }
    };

    // 初次获取
    fetchFaces();

    // 定时轮询
    const interval = setInterval(() => {
      fetchFaces();
    }, 2500); // 设置轮询间隔为 1 秒

    // 清理定时器
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex w-screen h-screen flex-col bg-white p-2 text-black">
        <div className="flex flex-row space-x-4 pt-2 pb-2 items-center justify-center">
          <Image src="/cad_logo.png" alt="show" width={40} height={40}></Image>
          <div className="text-2xl font-bold">
            北京邮电大学PCN&CAD中心 2024 年会
          </div>
        </div>
        <div className="flex w-full h-full overflow-hidden">
          <Carousel
            className="flex w-full h-full"
            prevArrow={({ handlePrev }) => (
              <div onClick={handlePrev} className="hidden"></div>
            )}
            nextArrow={({ handleNext }) => (
              <div onClick={handleNext} className="hidden"></div>
            )}
            navigation={({ setActiveIndex, activeIndex, length }) => (
              <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
                {new Array(length).fill('').map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1 cursor-pointer backdrop-invert rounded-full transition-all content-[''] ${
                      activeIndex === i ? 'w-8 bg-black/50' : 'w-4 bg-white/50'
                    }`}
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            )}
            autoplayDelay={10000}
            autoplay={true}
            loop={true}
            placeholder={undefined}
            transition={{
              type: 'tween',
              duration: 0.5,
            }}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {photos.length > 0 ? (
              photos.map((photo) => (
                <div
                  key={photo.file_id}
                  className="flex h-full w-full items-center justify-center"
                >
                  <FaceDetectionImage
                    imageUrl={photo.file_name}
                    faces={photo.faces}
                  />
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FaceDetectionImage imageUrl={'/default.jpeg'} faces={[]} />
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </>
  );
}
