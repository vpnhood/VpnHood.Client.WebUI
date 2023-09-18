<template>
  <!-- Minimize Premium Server ad -->
  <div id="minimizeStoreAd" @click="$emit('update:modelValue',true); showByUser = true">
    <img :src="require(`@/assets/images/ad-icon-minimize.png`)" width="40" alt="Premium Server Ad icon" />
    <h3 id="minimizeAdTitle" class="title-bold color-sharp-master-green text-capitalize ml-2">{{$t("STORE_AD_TITLE")}}</h3>
  </div>

  <!-- Maximize Premium Server Ad -->
  <v-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue',$event)"  close-on-back>
    <div id="storeAd" class="py-5 px-7 rounded-lg">
      <img :src="require(`@/assets/images/ad-icon.png`)" width="250" alt="Premium Server Ad icon" />
      <h3 id="adTitle" class="title-bold color-sharp-master-green text-uppercase pb-2 mb-5 mt-5">{{$t("STORE_AD_TITLE")}}</h3>
      <p id="adDesc" class="regular-font text--white text-left mb-7" v-html="$t('STORE_AD_DESCRIPTION')"></p>
      <a id="goPremiumBtn" :class="[showByUser ? 'sharp-btn' : 'sharp-bordered-btn', 'body-2 text-capitalize py-3 mb-4 rounded-xl']" href="https://play.google.com/store/apps/details?id=com.vphood.store.android" target="_blank"
         v-text="$t('GO_PREMIUM_ON_GOOGLE_PLAY')" ></a>
      <v-btn v-if="!showByUser" id="continueBtn" block height="auto" rounded class="sharp-btn text-capitalize px-3 py-3" @click="$vpnHoodApp.connect();">
        {{$t('CONTINUE_WITH_FREE_SLOW_SPEED')}}<v-icon class="ml-2">mdi-arrow-right-thin</v-icon>
      </v-btn>
      <v-btn v-else color="sky-blue" variant="outlined" block rounded class="text-capitalize px-3 py-5" @click="$emit('update:modelValue',false); showByUser = false">
        {{$t('CLOSE')}}
      </v-btn>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({
  name: "PremiumServerAd",
  data(){
    return{
      showByUser: false,
    }
  },
  props:{
    modelValue: Boolean,
  },
  emits: [
    "update:modelValue",
  ],
})
</script>

<style scoped>
#storeAd{
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
  background-color: var(--dark-blue);
}
#closeAddBtn{
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.05);
}
#closeAddBtn i{
  color: white;
  opacity: .5;
}
/*#addContent{
  border: 1px #16a4fd38 solid;
  padding: 30px 20px;
  border-radius: 25px;
}*/
#adTitle{
  font-size: 120%;
  border-bottom: 1px rgba(63, 246, 169, 0.15) solid;
}
#goPremiumBtn{
  text-decoration: none;
  display: block;
  width: 100%;
}
.sharp-btn{
  color: white;
  background-image: linear-gradient(to right, var(--sky-blue), var(--sharp-master-green));
  text-shadow: 0 0 4px #000000;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px 0 rgba(0, 0, 0, 0.14), 0 1px 14px 0 rgba(0, 0, 0, 0.12) !important;
}
.sharp-bordered-btn{
  color: var(--sharp-master-green);
  border: 1px var(--sharp-master-green) solid;
}
#adDesc{
  font-size: 17px;
  line-height: 31px;
}
#minimizeStoreAd{
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  border: 1px var(--sharp-master-green) solid;
  padding:3px 15px;
  margin: 0 auto;
}
#minimizeAdTitle{
  font-size: 100%;
}
</style>