const FooterCard = () => {
    return (
        <div className='card'>
            <p className='text-center text-gray-600 text-sm mt-2'>
                <b>
                    <span className='text-red-600'>주의:</span>
                </b>{' '}
                버그가 발생할 경우, 개발자(김준영)에게 제보해주세요.
            </p>

            <p className='text-center text-gray-600 text-sm mt-4'>
                개발 & 버그 제보 :{' '}
                <a href='https://github.com/yulmwu' className='text-blue-600'>
                    김준영
                </a>
                <span className='p-3'>|</span>
                데이터 제공: <span className='text-blue-600'>윤선우</span>
            </p>
        </div>
    )
}

export default FooterCard
