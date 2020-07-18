#ifndef TAL_NNU_H
#define TAL_NNU_H

#include <nan.h>

namespace nnu {
    v8::Local<v8::String> newString(const char *str) {
        return Nan::New(str).ToLocalChecked();
    }

    template <typename T> void setPrivate(v8::Local<v8::Object> target, const char *name, T val) {
        Nan::SetPrivate(target, nnu::newString(name), Nan::New(val));
    }

    template <typename T> void setPrivate(v8::Local<v8::Object> target, const char *name, T *ptr) {
        Nan::SetPrivate(target, nnu::newString(name), Nan::New<v8::External>(ptr));
    }

    template <typename T> struct GetPrivateImpl {
        T operator ()(v8::Local<v8::Object> target, const char *name) {
            v8::Local<v8::Value> val = Nan::GetPrivate(target, nnu::newString(name)).ToLocalChecked();
            return static_cast<T>(val->NumberValue());
        }
    };

    template <typename T> struct GetPrivateImpl<T*> {
        T *operator ()(v8::Local<v8::Object> target, const char *name) {
            v8::Local<v8::Value> val = Nan::GetPrivate(target, nnu::newString(name)).ToLocalChecked();
            return static_cast<T*>(v8::External::Cast(*val)->Value());
        }
    };

    v8::Local<v8::Value> getPrivate(v8::Local<v8::Object> target, const char *name) {
        return Nan::GetPrivate(target, nnu::newString(name)).ToLocalChecked();
    }

    template <typename T> T getPrivate(v8::Local<v8::Object> target, const char *name) {
        return GetPrivateImpl<T>()(target, name);
    }

    template <typename T, typename O, NAN_METHOD((O::*FN))> NAN_METHOD(wrapFunction) {
        T* pThis = Nan::ObjectWrap::Unwrap<T>(info.This());
        (pThis->*FN)(info);
    }

    template <typename T> class ClassWrap : public Nan::ObjectWrap {
    public:
        template<NAN_METHOD((T::*FN))> inline static NAN_METHOD(wrapFunction) {
            nnu::wrapFunction<T, T, FN>(info);
        }

        void static setup(v8::Local<v8::Object> exports) {
            v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(T::ctor);
            tpl->SetClassName(Nan::New(T::CLASS_NAME).ToLocalChecked());
            tpl->InstanceTemplate()->SetInternalFieldCount(1);

            T::setupMember(tpl);
			v8::Local<v8::Context> context = Nan::GetCurrentContext();
            exports->Set(context,Nan::New(T::CLASS_NAME).ToLocalChecked(), tpl->GetFunction(context).ToLocalChecked());
            _ctor.Reset(tpl->GetFunction(context).ToLocalChecked());
        }

        static v8::Local<v8::Object> newInstance() {
            return Nan::NewInstance(Nan::New(_ctor)).ToLocalChecked();
        }

        static v8::Local<v8::Object> newInstance(int argc, v8::Local<v8::Value> argv[]) {
            return Nan::NewInstance(Nan::New(_ctor), argc, argv).ToLocalChecked();
        }

    private:
        static Nan::Persistent<v8::Function> _ctor;
    };

    template<typename T> Nan::Persistent<v8::Function> ClassWrap<T>::_ctor;
}

#endif // TAL_NNU_H